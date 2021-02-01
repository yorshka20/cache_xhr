/*
 * @Author: yorshka
 * @Date: 2021-02-01 13:34:26
 * @Last Modified by: yorshka
 * @Last Modified time: 2021-02-01 13:39:27
 */

interface CacheItem {
  id: string;
  result: any;
}

interface RequestQueueItem {
  id: string;
  xhr: XMLHttpRequest;
}

export default class CacheXHR {
  static instance: CacheXHR;
  // 缓存容量
  cacheLengthLimit = 0;
  // 缓存bucket
  cachePool: Array<CacheItem> = [];
  // 请求队列
  requestQueue: Array<RequestQueueItem> = [];

  constructor(length: number) {
    if (CacheXHR.instance) {
      return CacheXHR.instance;
    }

    this.cachePool = [];
    this.requestQueue = [];
    this.cacheLengthLimit = length;

    CacheXHR.instance = this;
  }

  public get(url: string) {
    return new Promise((resolve, reject) => {
      // 检查缓存中是否存在结果
      let hasCache = false;
      let result;
      for (let cache of this.cachePool) {
        if (cache.id === `get:${url}`) {
          hasCache = true;
          result = cache;
        }
      }

      // 有缓存
      if (hasCache && result) {
        return resolve(result);
      }

      // 检测是否正在并发请求
      let isRequesting = false;
      let requestHandler;
      for (let request of this.requestQueue) {
        if (request.id === `get:${url}`) {
          isRequesting = true;
          requestHandler = request.xhr;
        }
      }

      if (isRequesting && requestHandler) {
        requestHandler.addEventListener("cached", (result) => {
          return resolve(result);
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.open("get", url);
      xhr.send();
    });
  }

  post(url: string, data = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("post", url);
      xhr.send(data as FormData);
    });
  }
}
