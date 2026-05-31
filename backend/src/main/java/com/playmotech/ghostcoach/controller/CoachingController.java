package com.playmotech.ghostcoach.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmotech.ghostcoach.model.CoachingSession;
import com.playmotech.ghostcoach.model.User;
import com.playmotech.ghostcoach.repository.CoachingSessionRepository;
import com.playmotech.ghostcoach.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analysis")
public class CoachingController {

    private static final Logger logger = LoggerFactory.getLogger(CoachingController.class);

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String UPLOAD_DIR = "uploads";

    @Transactional(readOnly = true)
    @GetMapping("/history")
    public ResponseEntity<?> getAthleteHistory() {
        User user = getAuthenticatedUser();
        List<CoachingSession> history = coachingSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        // We map each session schema out with correctly parsed JSON payloads
        List<Map<String, Object>> response = new ArrayList<>();
        for (CoachingSession session : history) {
            response.add(buildSessionResponseMap(session));
        }
        return ResponseEntity.ok(response);
    }

    @Transactional
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeAthleteStance(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "sport", required = false) String sport,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "experience", required = false) String experience) {
        User user = getAuthenticatedUser();

        try {
            MultipartFile selectedFile = (image != null && !image.isEmpty()) ? image : file;
            if (selectedFile == null || selectedFile.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No file uploaded. Use parameter name 'image' or 'file'."));
            }

            String mimeType = selectedFile.getContentType();
            if (mimeType == null || mimeType.trim().isEmpty()) {
                mimeType = "image/jpeg";
            }

            String imageBase64 = Base64.getEncoder().encodeToString(selectedFile.getBytes());

            String finalSport = (sport != null && !sport.trim().isEmpty()) ? sport : user.getSport();
            String finalPosition = (position != null && !position.trim().isEmpty()) ? position : user.getPosition();
            String finalExperience = (experience != null && !experience.trim().isEmpty()) ? experience : user.getExperience();

            // Build the dynamic multimodal system instructions prompt
            String systemInstructions = String.format(
                "You are an elite mechanical sports coach. You are assessing a stance photo. " +
                "The player is training for %s as a %s with a %s skill level. " +
                "Evaluate their physical alignment, posture, base balance, and readiness. " +
                "Return ONLY a raw JSON string matching this exact structure: " +
                "{\n" +
                "  \"overallScore\": 8.4,\n" +
                "  \"confidenceLevel\": \"High\",\n" +
                "  \"strengths\": [\"Strength point 1\", \"Strength point 2\"],\n" +
                "  \"areasToImprove\": [\n" +
                "    {\"flaw\": \"Description of error\", \"explanation\": \"Anatomical reasoning\"}\n" +
                "  ],\n" +
                "  \"priorityFix\": \"The single most important correction to practice first.\",\n" +
                "  \"drillSuggestion\": \"Name and detailed guide of an athletic drill.\"\n" +
                "}\n" +
                "Ensure output is valid JSON, do not wrap in markdown ```json or backticks.",
                finalSport, finalPosition, finalExperience
            );

            // Construct Gemini REST Payload structure
            Map<String, Object> body = new HashMap<>();
            
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemInstructions);

            Map<String, Object> inlineDataPart = new HashMap<>();
            Map<String, String> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", imageBase64);
            inlineDataPart.put("inlineData", inlineData);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(textPart, inlineDataPart));

            body.put("contents", List.of(contentPart));

            // Set request headers including query API keys
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<String> apiResponse = restTemplate.postForEntity(urlWithKey, entity, String.class);
            if (!apiResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Gemini engine rejected stance transmission.");
            }

            // Extract the generated text block
            Map<?, ?> root = objectMapper.readValue(apiResponse.getBody(), Map.class);
            List<?> candidates = (List<?>) root.get("candidates");
            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            String rawJsonText = ((String) firstPart.get("text")).trim();

            // Clean markdown blocks if returned
            if (rawJsonText.startsWith("```")) {
                rawJsonText = rawJsonText.substring(rawJsonText.indexOf("{"));
                rawJsonText = rawJsonText.substring(0, rawJsonText.lastIndexOf("}") + 1);
            }

            // Deserialize to verify format schema compliance
            @SuppressWarnings("unchecked")
            Map<String, Object> analysisData = objectMapper.readValue(rawJsonText, Map.class);
            
            Double overallScore = (analysisData.get("overallScore") != null) ? Double.valueOf(String.valueOf(analysisData.get("overallScore"))) : 7.0;
            String confidenceLevel = (analysisData.get("confidenceLevel") != null) ? String.valueOf(analysisData.get("confidenceLevel")) : "Medium";
            String priorityFix = (analysisData.get("priorityFix") != null) ? String.valueOf(analysisData.get("priorityFix")) : "Focus on lower-body balance.";
            String drillSuggestion = (analysisData.get("drillSuggestion") != null) ? String.valueOf(analysisData.get("drillSuggestion")) : "Static pose holding.";

            List<?> strengths = (List<?>) analysisData.get("strengths");
            String strengthsJoined = objectMapper.writeValueAsString(strengths);
            
            List<?> areas = (List<?>) analysisData.get("areasToImprove");
            String areasJson = objectMapper.writeValueAsString(areas);

            // Ensure local upload directory exists
            java.io.File uploadFolder = new java.io.File(UPLOAD_DIR);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            // Generate safe unique filename
            String originalFilename = selectedFile.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".jpg";
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            java.nio.file.Path targetPath = java.nio.file.Paths.get(UPLOAD_DIR).resolve(uniqueFilename);
            java.nio.file.Files.copy(selectedFile.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String relativeImageUrl = "/api/analysis/images/" + uniqueFilename;

            // Persist the verified physical session to Postgres
            CoachingSession session = CoachingSession.builder()
                    .user(user)
                    .photoBase64(relativeImageUrl)
                    .sport(finalSport)
                    .position(finalPosition)
                    .experience(finalExperience)
                    .overallScore(overallScore)
                    .confidenceLevel(confidenceLevel)
                    .priorityFix(priorityFix)
                    .drillSuggestion(drillSuggestion)
                    .strengthsJoined(strengthsJoined)
                    .areasToImproveJson(areasJson)
                    .createdAt(LocalDateTime.now())
                    .build();

            CoachingSession saved = coachingSessionRepository.save(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(buildSessionResponseMap(saved));

        } catch (Exception e) {
            logger.error("Failed to compile laser coaching mechanics payload:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "AI Vision pipeline failure: " + e.getMessage()));
        }
    }

    @Transactional
    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> discardSessionCard(@PathVariable String id) {
        User user = getAuthenticatedUser();
        var sessionOpt = coachingSessionRepository.findById(id);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Stance analysis session not found."));
        }

        CoachingSession session = sessionOpt.get();
        if (!session.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized database eviction."));
        }

        // Deep-clean file on disk if exists
        String photoUrl = session.getPhotoBase64();
        if (photoUrl != null && photoUrl.startsWith("/api/analysis/images/")) {
            String filename = photoUrl.substring("/api/analysis/images/".length());
            try {
                java.nio.file.Path fileToDelete = java.nio.file.Paths.get(UPLOAD_DIR).resolve(filename).normalize();
                java.nio.file.Files.deleteIfExists(fileToDelete);
            } catch (Exception e) {
                logger.warn("Could not delete physical file for session: " + filename, e);
            }
        }

        coachingSessionRepository.delete(session);
        return ResponseEntity.ok(Map.of("status", "Stance cleared from history logs."));
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<byte[]> getUploadedImage(@PathVariable String filename) {
        try {
            java.nio.file.Path uploadsDir = java.nio.file.Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            java.nio.file.Path filePath = uploadsDir.resolve(filename).normalize();

            // 1. Direct physical file match
            if (filePath.startsWith(uploadsDir) && java.nio.file.Files.exists(filePath)) {
                byte[] bytes = java.nio.file.Files.readAllBytes(filePath);
                String contentType = java.nio.file.Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "image/jpeg";
                }
                return ResponseEntity.ok()
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, must-revalidate")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(bytes);
            }

            // 2. Scan if filename is actually a coaching session ID (with or without extension)
            String lookupId = filename;
            if (lookupId.contains(".")) {
                lookupId = lookupId.substring(0, lookupId.lastIndexOf("."));
            }

            Optional<CoachingSession> sessionOpt = coachingSessionRepository.findById(lookupId);
            if (sessionOpt.isPresent()) {
                CoachingSession session = sessionOpt.get();
                String rawPhotoData = session.getPhotoBase64();

                if (rawPhotoData != null) {
                    // Handle stored inline base64
                    if (rawPhotoData.contains(";base64,")) {
                        String[] parts = rawPhotoData.split(";base64,");
                        String mime = parts[0].replace("data:", "");
                        byte[] bytes = Base64.getDecoder().decode(parts[1]);
                        return ResponseEntity.ok()
                                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, must-revalidate")
                                .contentType(MediaType.parseMediaType(mime))
                                .body(bytes);
                    } else if (rawPhotoData.startsWith("data:")) {
                        String pureBase64 = rawPhotoData.substring(rawPhotoData.indexOf(",") + 1);
                        byte[] bytes = Base64.getDecoder().decode(pureBase64);
                        return ResponseEntity.ok()
                                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, must-revalidate")
                                .contentType(MediaType.IMAGE_JPEG)
                                .body(bytes);
                    } else if (rawPhotoData.startsWith("/api/analysis/images/")) {
                        // Extract actual file name and read from uploads directory
                        String actualFilename = rawPhotoData.substring("/api/analysis/images/".length());
                        java.nio.file.Path actualFilePath = uploadsDir.resolve(actualFilename).normalize();
                        if (actualFilePath.startsWith(uploadsDir) && java.nio.file.Files.exists(actualFilePath)) {
                            byte[] bytes = java.nio.file.Files.readAllBytes(actualFilePath);
                            String contentType = java.nio.file.Files.probeContentType(actualFilePath);
                            if (contentType == null) {
                                contentType = "image/jpeg";
                            }
                            return ResponseEntity.ok()
                                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, must-revalidate")
                                    .contentType(MediaType.parseMediaType(contentType))
                                    .body(bytes);
                        }
                    } else {
                        // Assume direct file path or filename
                        java.nio.file.Path actualFilePath = uploadsDir.resolve(rawPhotoData).normalize();
                        if (actualFilePath.startsWith(uploadsDir) && java.nio.file.Files.exists(actualFilePath)) {
                            byte[] bytes = java.nio.file.Files.readAllBytes(actualFilePath);
                            String contentType = java.nio.file.Files.probeContentType(actualFilePath);
                            if (contentType == null) {
                                contentType = "image/jpeg";
                            }
                            return ResponseEntity.ok()
                                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, must-revalidate")
                                    .contentType(MediaType.parseMediaType(contentType))
                                    .body(bytes);
                        }
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    @PutMapping("/calibration")
    public ResponseEntity<?> updateAthleteCalibration(@RequestBody Map<String, String> request) {
        User user = getAuthenticatedUser();
        String experience = request.get("experience");
        String position = request.get("position");
        String sport = request.get("sport");

        if (experience == null || experience.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Experience field is mandatory."));
        }
        if (position == null || position.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Position field is mandatory."));
        }

        user.setExperience(experience.trim());
        user.setPosition(position.trim());
        if (sport != null && !sport.trim().isEmpty()) {
            user.setSport(sport.trim());
        }
        User updated = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "status", "Athlete calibration updated successfully.",
            "user", Map.of(
                "id", updated.getId(),
                "username", updated.getUsername(),
                "fullName", updated.getFullName(),
                "sport", updated.getSport(),
                "position", updated.getPosition(),
                "experience", updated.getExperience()
            )
        ));
    }

    private User getAuthenticatedUser() {
        UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("Principal user reference missing."));
    }

    private Map<String, Object> buildSessionResponseMap(CoachingSession session) {
        try {
            Map<String, Object> map = new HashMap<>();
            map.put("id", session.getId());
            map.put("photoBase64", session.getPhotoBase64());
            map.put("sport", session.getSport());
            map.put("position", session.getPosition());
            map.put("experience", session.getExperience());
            map.put("createdAt", session.getCreatedAt().toString());

            Map<String, Object> analysis = new HashMap<>();
            analysis.put("overallScore", session.getOverallScore());
            analysis.put("confidenceLevel", session.getConfidenceLevel());
            analysis.put("priorityFix", session.getPriorityFix());
            analysis.put("drillSuggestion", session.getDrillSuggestion());

            analysis.put("strengths", objectMapper.readValue(session.getStrengthsJoined(), List.class));
            analysis.put("areasToImprove", objectMapper.readValue(session.getAreasToImproveJson(), List.class));

            map.put("analysis", analysis);
            return map;
        } catch (Exception e) {
            throw new RuntimeException("Payload decoding violation inside PostgreSQL columns", e);
        }
    }
}
