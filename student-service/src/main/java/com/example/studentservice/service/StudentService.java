package com.example.studentservice.service;

import com.example.studentservice.dto.StudentRequest;
import com.example.studentservice.model.Student;
import com.example.studentservice.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student create(StudentRequest req) {
        if (studentRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A student with this email already exists");
        }
        Student student = new Student();
        copy(req, student);
        return studentRepository.save(student);
    }

    // One page of students, sorted by id. page starts at 0.
    public Page<Student> getPage(int page, int size) {
        return studentRepository.findAll(PageRequest.of(page, size, Sort.by("id").ascending()));
    }

    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with id " + id));
    }

    public Student update(Long id, StudentRequest req) {
        Student student = getById(id);

        // the email may stay the same, but must not belong to a different student
        studentRepository.findByEmail(req.getEmail()).ifPresent(other -> {
            if (!other.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A student with this email already exists");
            }
        });

        copy(req, student);
        return studentRepository.save(student);
    }

    public void delete(Long id) {
        Student student = getById(id);   // 404 if missing
        studentRepository.delete(student);
    }

    private void copy(StudentRequest req, Student student) {
        student.setFullName(req.getFullName());
        student.setEmail(req.getEmail());
        student.setAge(req.getAge());
        student.setCourse(req.getCourse());
        student.setPhoneNumber(req.getPhoneNumber());
    }
}
