package com.company.projectmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 全局CORS处理控制器
 * 处理所有的OPTIONS预检请求
 */
@RestController
public class GlobalCorsController {

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "http://localhost:3000")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
                .header("Access-Control-Allow-Credentials", "true")
                .header("Access-Control-Max-Age", "3600")
                .build();
    }
}
