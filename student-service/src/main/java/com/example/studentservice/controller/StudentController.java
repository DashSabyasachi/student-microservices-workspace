package com.example.studentservice.controller;

import com.example.studentservice.dto.PageResponse;
import com.example.studentservice.dto.StudentRequest;
import com.example.studentservice.model.Student;
import com.example.studentservice.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<Student> add(@Valid @RequestBody StudentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(req));
    }

    // GET /api/students?page=0&size=5
    @GetMapping
    public PageResponse<Student> getAll(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "5") int size) {
        int safePage = Math.max(page, 0);                 // never negative
        int safeSize = Math.min(Math.max(size, 1), 100);  // between 1 and 100
        return new PageResponse<>(studentService.getPage(safePage, safeSize));
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return studentService.getById(id);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @Valid @RequestBody StudentRequest req) {
        return studentService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        studentService.delete(id);
        return Map.of("message", "Student deleted successfully");
    }
}
