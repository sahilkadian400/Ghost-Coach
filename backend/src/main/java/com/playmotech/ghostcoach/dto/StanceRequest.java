package com.playmotech.ghostcoach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StanceRequest {
    @NotBlank
    private String imageBase64;
    
    @NotBlank
    private String mimeType;
}
