package com.example.studentservice.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/** What the dashboard receives for one page of students. */
public class PageResponse<T> {

    private final List<T> content;       // the rows of THIS page
    private final int page;              // current page number (starts at 0)
    private final int size;              // rows per page
    private final long totalElements;    // total rows in the table
    private final int totalPages;

    public PageResponse(Page<T> p) {
        this.content = p.getContent();
        this.page = p.getNumber();
        this.size = p.getSize();
        this.totalElements = p.getTotalElements();
        this.totalPages = p.getTotalPages();
    }

    public List<T> getContent() { return content; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
}
