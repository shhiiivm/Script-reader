package com.promptcam.service;

import com.promptcam.entity.Script;
import com.promptcam.repository.ScriptRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class ScriptService {

    private final ScriptRepository scriptRepository;

    public ScriptService(ScriptRepository scriptRepository) {
        this.scriptRepository = scriptRepository;
    }

    public List<Script> getAllScripts() throws ExecutionException, InterruptedException {
        return scriptRepository.findAll();
    }

    public Script getScriptById(String id) throws ExecutionException, InterruptedException {
        Script script = scriptRepository.findById(id);
        if (script == null) {
            throw new RuntimeException("Script not found");
        }
        return script;
    }

    public Script createScript(Script script) throws ExecutionException, InterruptedException {
        script.setCreatedAt(LocalDateTime.now());
        script.setUpdatedAt(LocalDateTime.now());
        return scriptRepository.save(script);
    }

    public Script updateScript(String id, Script scriptDetails) throws ExecutionException, InterruptedException {
        Script script = getScriptById(id);
        script.setTitle(scriptDetails.getTitle());
        script.setContent(scriptDetails.getContent());
        script.setUpdatedAt(LocalDateTime.now());
        return scriptRepository.save(script);
    }

    public void deleteScript(String id) throws ExecutionException, InterruptedException {
        scriptRepository.delete(id);
    }
}
