import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';

export class CustomToastOptions extends ToastOptions {
    animate = 'fade';
    dismiss = 'auto';
    showCloseButton = true;
    newestOnTop = true;
    enableHTML = true;
    positionClass = "toast-bottom-right";
    // messageClass = '';
    // titleClass = '';
}
