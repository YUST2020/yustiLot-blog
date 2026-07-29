import { createVNode, render, type Component, shallowReactive, type ComponentInternalInstance, type App } from 'vue';
import { preventAsyncRepeat } from '@/lib/utils';

// 全局应用实例，由 main.ts 通过 setApp 注入（替代 Nuxt 的 useNuxtApp）
let _app: App | null = null;
export function setApp(app: App) {
  _app = app;
}

// 弹窗控制器初始化（从 useDialogOpen 迁移，去除 useNuxtApp 依赖）
export class DialogController {
  private _dlgDefine: Map<string, Component> = new Map();
  private _instanceMap: Map<
    string,
    {
      container: HTMLElement;
      instance: ComponentInternalInstance;
      resolveFn: () => void;
      rejectFn: () => void;
    }
  > = new Map();

  get instanceList() {
    return Array.from(this._instanceMap).map(([key, value]) => ({ id: key, instance: value.instance }));
  }

  register(dlgList: Component[]) {
    for (const comp of dlgList) {
      if (comp.name) {
        this._dlgDefine.set(comp.name as string, comp);
      } else {
        console.warn('待注册弹窗组件缺失组件名');
      }
    }
  }

  create(
    dlg: string | Component,
    options: {
      dlgId?: string;
      onConfirm?: (...emitParam: any[]) => any;
      onClose?: (...emitParam: any[]) => any;
      onCancel?: (...emitParam: any[]) => any;
      [key: string]: any;
    } = {},
    slots?: any,
  ) {
    return new Promise((resolve, reject) => {
      const container = document.createElement('div');
      const dlgId =
        options?.dlgId || crypto?.randomUUID?.() || 'fs-dialog' + Date.now() + Math.floor(Math.random() * 1000);

      if (options?.dlgId) {
        this.rejectById(options.dlgId);
        delete options.dlgId;
      }

      const destroy = () => {
        setVisible(false);
        this._instanceMap.delete(dlgId);
        setTimeout(() => {
          render(null, container);
          container.remove();
        }, 1000);
      };

      const resolveFn = (data?: any) => {
        resolve(data);
        destroy();
      };

      const rejectFn = () => {
        reject();
        destroy();
      };

      const props = shallowReactive({
        visible: false,
        modelValue: false,
        autoClose: false,
        ...options,
        onClose: preventAsyncRepeat(async (...emitParam: any[]) => {
          typeof options?.onClose === 'function' && (await options.onClose(...emitParam));
          rejectFn();
        }),
        onCancel: preventAsyncRepeat(async (...emitParam: any[]) => {
          typeof options?.onCancel === 'function' && (await options.onCancel(...emitParam));
          rejectFn();
        }),
        onConfirm: preventAsyncRepeat(async (...emitParam: any[]) => {
          typeof options?.onConfirm === 'function' && (await options.onConfirm(...emitParam));
          resolveFn(emitParam[0]);
        }),
        onResolve: (data?: any) => resolveFn(data),
        'onUpdate:visible': (val: boolean) => {
          !val && rejectFn();
        },
        'onUpdate:modelValue': (val: boolean) => {
          !val && rejectFn();
        },
      });

      const setVisible = (val: boolean) => {
        props.visible = val;
        props.modelValue = val;
      };

      const dlgComp = typeof dlg === 'string' ? this._dlgDefine.get(dlg)! : dlg;
      if (!dlgComp) {
        reject();
        throw new Error('异常调用未注册的弹窗');
      }

      const vNode = createVNode({
        setup() {
          return () => createVNode(dlgComp, props as any, slots);
        },
      });

      setVisible(true);

      // 注入全局应用上下文（替代 useNuxtApp().vueApp._context）
      if (_app) {
        vNode.appContext = _app._context;
      }

      render(vNode, container);
      document.body.appendChild(container);

      const instance = vNode.component!;

      this._instanceMap.set(dlgId, { instance, container, resolveFn, rejectFn });
    });
  }

  rejectAll() {
    for (const dlgId of this._instanceMap.keys()) {
      this.rejectById(dlgId);
    }
  }

  rejectById(dlgId: string) {
    const dlgRow = this._instanceMap.get(dlgId);
    if (dlgRow) {
      dlgRow.rejectFn();
    }
  }

  resolveAll() {
    for (const dlgId of this._instanceMap.keys()) {
      this.resolveById(dlgId);
    }
  }

  resolveById(dlgId: string) {
    this._instanceMap.get(dlgId)?.resolveFn();
  }

  getInstance(dlgId: string) {
    return this._instanceMap.get(dlgId)?.instance;
  }
}

export const dialogController = new DialogController();
export const useDialogOpen = dialogController.create.bind(dialogController);
