package org.example.project.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService{

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        // File name of orginal file
        String orgnalFileName = file.getOriginalFilename();
        // Generate a unique file name
        String randomId = UUID.randomUUID().toString();
        String filename = randomId.concat(orgnalFileName
                .substring(orgnalFileName.lastIndexOf('.'))); // /image/x/y/snfuw.jpg -> randomId.jpg
        String filePath = path + File.separator + filename;
        // check if path exists or create
        File folder = new File(path);
        if ( !folder.exists()){
            folder.mkdir();
        }
        // upload to server
        Files.copy(file.getInputStream(), Paths.get(filePath));
        // returnning file name
        return filename;
    }
}
