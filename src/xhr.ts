/*
 * @Author: yorshka
 * @Date: 2021-02-01 13:34:26
 * @Last Modified by: yorshka
 * @Last Modified time: 2021-02-01 15:09:33
 */

interface CacheItem {
  id: string;
  result: any;
}

export default class CacheXHR {
  static instance: CacheXHR;

  // 缓存容量
  private cacheLengthLimit = 0;
  // 缓存bucket
  private cachePool: Array<CacheItem> = [];
  // 请求队列
  private requestQueue: Map<string, XMLHttpRequest> | undefined;

  constructor(length: number) {
    if (CacheXHR.instance) {
      return CacheXHR.instance;
    }

    this.cachePool = [];
    this.requestQueue = new Map<string, XMLHttpRequest>();
    this.cacheLengthLimit = length;

    CacheXHR.instance = this;
  }

  public get(url: string) {
    return new Promise((resolve, reject) => {
      const id = `get:${url}`;

      // 检查缓存中是否存在结果
      let hasCache = false;
      let result;
      for (let cache of this.cachePool) {
        if (cache.id === id) {
          hasCache = true;
          result = cache;
        }
      }

      // 有缓存
      if (hasCache && result) {
        return resolve(result.result);
      }

      // 检测是否正在并发请求
      let isRequesting = false;
      let requestHandler;
      const pendingRequest = this.requestQueue?.get(id);
      if (pendingRequest) {
        isRequesting = true;
        requestHandler = pendingRequest;
      }

      // 若存在请求，则等待当前请求的onload
      if (isRequesting && requestHandler) {
        requestHandler.onload = (e: any) => {
          const responseText = e!.currentTarget?.responseText;
          return resolve(responseText);
        };
      } else {
        // 没有缓存，新建请求
        const xhr = new XMLHttpRequest();
        // 请求入队列
        this.requestQueue!.set(id, xhr);

        xhr.open("get", url);
        xhr.onload = (e: ProgressEvent) => {
          // 检查缓存容量
          if (this.cacheLengthLimit < this.cachePool.length) {
            this.cachePool.shift();
          }

          // 加入缓存
          this.cachePool.push({
            id,
            result: xhr.responseText,
          });

          // 从请求队列中清除
          this.requestQueue?.delete(id);

          return resolve(xhr.responseText);
        };

        xhr.onerror = (err: any) => {
          return reject(err);
        };

        try {
          xhr.send();
        } catch (error) {
          reject(error);
        }
      }
    });
  }
}
