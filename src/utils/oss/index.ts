import * as AliOOS from 'ali-oss';
import { ACCESS_KEY_ID, ACCESS_KEY_SECRET, BUCKET_URL, BUCKET, REGION } from './config';

const OOSClient = new AliOOS({
  region: REGION,
  accessKeyId: ACCESS_KEY_ID,
  accessKeySecret: ACCESS_KEY_SECRET,
  bucket: BUCKET
})

// 获取资源列表
export const listBuckets = async () => {
  try {
    const result: any = await OOSClient.listBuckets({});
    if (result) {
      return result.buckets || []
    }
  } catch (err) {
    console.log(err);
    return []
  }
}

// 获取文件列表
export const getFileList = async () => {
  // 不带任何参数，默认最多返回100个文件。
  let result = await OOSClient.list({ 'max-keys': 100 }, {});
  if (result && result.res.status === 200) {
    return result.objects || []
  }
  return []
}

// 上传文件
type PutFileOptions = {
  dir?: string,
  expires?: string
}
export const putFile = async (filename: string, file: Express.Multer.File, options?: PutFileOptions) => {
  const { dir, expires } = options || {}
  // 指定Object的访问权限
  // x-oss-object-acl
  // 合法值：public-read，private，public-read-write
  // default: private
  // https://help.aliyun.com/document_detail/32070.html

  const name = (dir || '') + filename;
  const result = await OOSClient.put(name, file.buffer, {
    headers: {
      'x-oss-object-acl': 'public-read',
      'Expires': expires
    }
  });
  if (result && result.res.status === 200) {
    // console.log('result', result)
    // {
    //   name: '未标题-1.png',
    //   url: 'http://my-images-manager.oss-cn-chengdu.aliyuncs.com/%E6%9C%AA%E6%A0%87%E9%A2%98-1.png',
    //   res: {
    //     status: 200,
    //     statusCode: 200,
    //     statusMessage: 'OK',
    //     headers: {
    //       server: 'AliyunOSS',
    //       date: 'Tue, 19 Mar 2024 06:28:03 GMT',
    //       'content-length': '0',
    //       connection: 'keep-alive',
    //       'x-oss-request-id': '65F93073A3A9C633349B9E44',
    //       etag: '"24E9078875B8B12CBC86420305E36ABE"',
    //       'x-oss-hash-crc64ecma': '9843934234743038328',
    //       'content-md5': 'JOkHiHW4sSy8hkIDBeNqvg==',
    //       'x-oss-server-time': '17'
    //     },
    //     size: 0,
    //     aborted: false,
    //     rt: 417,
    //     keepAliveSocket: false,
    //     data: <Buffer >,
    //     requestUrls: [
    //       'http://my-images-manager.oss-cn-chengdu.aliyuncs.com/%E6%9C%AA%E6%A0%87%E9%A2%98-1.png'
    //     ],
    //     timing: null,
    //     remoteAddress: '47.108.5.120',
    //     remotePort: 80,
    //     socketHandledRequests: 1,
    //     socketHandledResponses: 1
    //   }
    return { filename, url: `${BUCKET_URL}/${result.name}` };
  }
  /**
   * name: 'undraw.png',
   * url: '${BUCKET_URL}/undraw.png',
   * res: object
   */
  return '';
}

// 批量上传
export const putFiles = async (fileObjects: { filename: string, file: Express.Multer.File, dir: string }[]) => {
  return Promise.allSettled(fileObjects.map(item => putFile(item.filename, item.file, { dir: item.dir })))
}

// 判断文件是否存在
export const isExist = async (name: string) => {
  try {
    await OOSClient.head(name);
    return true
  } catch (error) {
    // if (error.code === 'NoSuchKey') {
    //   console.log('文件不存在')
    // }
    return false
  }
}

// 移除文件
export const removeFile = async (filename: string, dir?: string) => {
  const name = (dir ? dir + '/' : '') + filename;
  // const haveFile = await isExist(name);
  // console.log('haveFile', haveFile)
  try {
    await OOSClient.delete(name);
    return true
  } catch (error) {
    return false
  }
}
