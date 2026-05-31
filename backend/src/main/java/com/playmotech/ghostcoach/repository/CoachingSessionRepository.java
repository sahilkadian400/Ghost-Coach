package com.playmotech.ghostcoach.repository;

import com.playmotech.ghostcoach.model.CoachingSession;
import com.playmotech.ghostcoach.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoachingSessionRepository extends JpaRepository<CoachingSession, String> {
    List<CoachingSession> findByUserOrderByCreatedAtDesc(User user);
    List<CoachingSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
