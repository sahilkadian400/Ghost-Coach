/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  sport: string;
  position: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface StanceAnalysis {
  overallScore: number;
  strengths: string[];
  areasToImprove: { flaw: string; explanation: string }[] | string[] | any;
  priorityFix: string;
  drillSuggestion: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
}

export interface CoachingSession {
  id: string;
  userId: string;
  photoBase64: string;
  createdAt: string;
  sport: string;
  position: string;
  experience: string;
  analysis: StanceAnalysis;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
