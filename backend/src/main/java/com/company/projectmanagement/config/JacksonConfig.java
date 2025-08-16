package com.company.projectmanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register JSR310 module to handle Java 8 time types
        mapper.registerModule(new JavaTimeModule());

        // Register Hibernate6 module to handle lazy loading issues
        Hibernate6Module hibernateModule = new Hibernate6Module();
        hibernateModule.disable(Hibernate6Module.Feature.USE_TRANSIENT_ANNOTATION);
        hibernateModule.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        hibernateModule.enable(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);
        mapper.registerModule(hibernateModule);

        // Configure Jackson to handle lazy loading issues properly
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        // Disable writing dates as timestamps (use ISO format instead)
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;
    }
}
