package com.ssh.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String productId;
    private String name;
    private String description;
    private Double price;
    private Double rating;
    private Integer stock;
    private Boolean isFeatured;
    private String categoryName;
    private Long categoryId;
    private List<String> images;
    private LocalDate createdAt;
}
