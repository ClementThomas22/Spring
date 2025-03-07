package com.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SinglePageAppController {
    @GetMapping({"/", "/{path:^(?!api).*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
