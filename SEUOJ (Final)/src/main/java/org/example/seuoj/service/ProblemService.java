package org.example.seuoj.service;

import org.example.seuoj.model.Difficulty;
import org.example.seuoj.model.Problem;
import org.example.seuoj.payload.Problem.ProblemDTO;
import org.example.seuoj.payload.Problem.ProblemDetailDTO;
import org.example.seuoj.payload.Problem.ProblemResponse;

public interface ProblemService {
    ProblemDetailDTO createProblem(ProblemDetailDTO problemDTO, String adminUsername);
    ProblemDetailDTO updateProblem(Long problemId, ProblemDetailDTO problemDTO, String adminUsername);
    void deleteProblem(Long problemId, String adminUsername);
    ProblemDetailDTO getProblemById(Long problemId);
    Problem getProblemEntityById(Long problemId);
    ProblemResponse getAllProblems(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String search, Difficulty difficulty, String currentUsername);
    ProblemDetailDTO toggleProblemVisibility(Long problemId, Boolean isVisible, String adminUsername);
    ProblemDetailDTO proposeProblem(ProblemDetailDTO problemDTO, String username);
    ProblemResponse getPendingProblems(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    ProblemDetailDTO approveProblem(Long problemId, String adminUsername);
}
