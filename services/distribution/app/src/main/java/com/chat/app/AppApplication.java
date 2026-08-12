package com.chat.app;

import com.chat.app.configs.RestClientConfig;
import com.chat.app.configs.RestTemplateConfig;
import com.chat.app.configs.SecurityConfig;
import com.chat.app.configs.WebSocketConfig;
import com.chat.app.controllers.DistributionController;
import com.chat.app.exceptions.GlobalExceptionHandler;
import com.chat.app.repositories.RoomRedisRepository;
import com.chat.app.services.DistributionService;
import com.chat.app.services.DistributionRoomStore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication(excludeName = {
        // Distribution Service không dùng database riêng, nên tắt auto-config DataSource/JPA.
        "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration",
        "org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration",
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
        "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
        "org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
})
@ComponentScan(
        useDefaultFilters = false,
        includeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                        DistributionController.class,
                        DistributionService.class,
                        DistributionRoomStore.class,
                        RoomRedisRepository.class,
                        RestClientConfig.class,
                        RestTemplateConfig.class,
                        SecurityConfig.class,
                        WebSocketConfig.class,
                        GlobalExceptionHandler.class
                }
        )
)
public class AppApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }

}
