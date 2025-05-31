"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IStatus = void 0;
// export enum IStatus {
//   Pending = "Pending",
//   Approved = "Approved",
//   Rejected = "Rejected",
// }
var IStatus;
(function (IStatus) {
    IStatus["Created"] = "created";
    IStatus["Updated"] = "updated";
    IStatus["Approved"] = "approved";
    IStatus["Rejected"] = "rejected";
    IStatus["Deleted"] = "deleted";
    IStatus["Pending"] = "pending";
})(IStatus || (exports.IStatus = IStatus = {}));
