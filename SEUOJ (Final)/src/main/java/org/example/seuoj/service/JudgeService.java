package org.example.seuoj.service;

import org.example.seuoj.model.Submission;
import org.example.seuoj.model.TestCase;
import org.example.seuoj.payload.Submission.RunResultDTO;
import org.example.seuoj.model.Language;

import java.util.List;

public interface JudgeService {
    void execute(Submission submission, List<TestCase> testCases);

    /** Compile and run code against custom stdin — does NOT save to DB */
    RunResultDTO run(String code, Language language, String stdin, long timeLimitMs);
}
