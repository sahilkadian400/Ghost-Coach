package com.playmotech.ghostcoach.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coaching_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "photo_base64", nullable = false, columnDefinition = "TEXT")
    private String photoBase64;

    @Column(nullable = false)
    private String sport;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private String experience;

    // We store the structured analysis elements directly
    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    @Column(name = "confidence_level", nullable = false)
    private String confidenceLevel;

    @Column(name = "priority_fix", nullable = false, length = 1000)
    private String priorityFix;

    @Column(name = "drill_suggestion", nullable = false, length = 2000)
    private String drillSuggestion;

    // Structured JSON or comma-separated lists for strengths & areas to improve
    @Column(columnDefinition = "TEXT")
    private String strengthsJoined;

    @Column(name = "areas_to_improve_json", columnDefinition = "TEXT")
    private String areasToImproveJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
