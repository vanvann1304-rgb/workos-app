import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../../uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
      'video/mp4','video/webm','video/quicktime',
      'application/pdf',
      'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip','application/x-zip-compressed',
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(psd|ai)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

const router = Router();

router.post('/:taskId', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const url = `/uploads/${req.file.filename}`;
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run('INSERT INTO attachments (id, task_id, type, name, url, file_size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.taskId, 'file', req.file.originalname, url, req.file.size, req.file.mimetype, now]);
    
    await db.run('INSERT INTO activity_logs (id, task_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.params.taskId, 'file_uploaded', `Đã upload: ${req.file.originalname}`, now]);
    
    res.status(201).json({ id, url, name: req.file.originalname, size: req.file.size, type: 'file' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
