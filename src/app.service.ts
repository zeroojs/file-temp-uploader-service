import { Injectable } from '@nestjs/common';
import { putFile } from 'src/utils/oss';
import * as md5 from 'md5'
import { hash } from 'spark-md5';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async upload(files: (Express.Multer.File)[]) {
    // 文件数量校验
    if (files.length > 50) return { message: '一次性最多只能上传50张图片' } // 一次性最多只能上传50张图片
    let flag = true;
    // 格式校验
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!/image/.test(file.mimetype)) {
        flag = false;
        break
      }
    }
    if (!flag) return { code: 201, message: '仅支持图片格式' };
    const result = await Promise.all(files.map(file => {
      // 防止同名不同文件
      const hash = md5(file.buffer)
      // 处理中文文件名乱码
      const originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');
      const suffix = originalname.split('.').pop();
      const fileHeader = originalname.replace(`.${suffix}`, '');
      const fullFileName = `${fileHeader}_${hash}.${suffix}`;
      return putFile(fullFileName, file)
    }));
    return { code: 200, data: result, message: 'ok' };
  }
}
