import watch from 'node-watch';
import fetch from 'node-fetch';
import {createReadStream, writeFileSync, readFileSync, unlinkSync } from 'fs';
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import nodePath from 'path';
import FormData from 'form-data';

const app = express();
const syncOutDir = process.env.SYNC_OUT_DIR;
const syncInDir = process.env.SYNC_IN_DIR;
const upload = multer({dest: 'uploads/'})
 
watch(syncOutDir, {recursive: false}, async (evt, name) => {
    if (evt == 'remove') {
        return
    }
    const file = createReadStream(name)

    const form = new FormData();
    form.append('file',file)
 
    await fetch(`${process.env.REMOTE_URL}`, {method: 'POST', body: form})

    unlinkSync(name);
})

app.post("/files", upload.single("file"), function(req, res, next) {
  const { originalname, path } = req.file;
  const file = readFileSync(path);
  writeFileSync(nodePath.join(syncInDir, originalname), file);
  unlinkSync(path);
  res.status(200);
  res.send("success");
}) 

app.listen(process.env.PORT); 