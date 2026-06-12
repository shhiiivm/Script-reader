package com.promptcam.controller;

import com.promptcam.entity.Script;
import com.promptcam.service.ScriptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scripts")
@CrossOrigin(origins = "*")
public class ScriptController {

    private final ScriptService scriptService;

    public ScriptController(ScriptService scriptService) {
        this.scriptService = scriptService;
    }

    @GetMapping
    public ResponseEntity<List<Script>> getAllScripts() throws Exception {
        return ResponseEntity.ok(scriptService.getAllScripts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Script> getScriptById(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(scriptService.getScriptById(id));
    }

    @PostMapping
    public ResponseEntity<Script> createScript(@RequestBody Script script) throws Exception {
        return ResponseEntity.ok(scriptService.createScript(script));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Script> updateScript(@PathVariable String id, @RequestBody Script script) throws Exception {
        return ResponseEntity.ok(scriptService.updateScript(id, script));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScript(@PathVariable String id) throws Exception {
        scriptService.deleteScript(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : ""));
    }
}
