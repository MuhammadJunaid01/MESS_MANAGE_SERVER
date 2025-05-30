"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IActivityAction = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["Credit"] = "credit";
    TransactionType["Debit"] = "debit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var IActivityAction;
(function (IActivityAction) {
    IActivityAction["Created"] = "created";
    IActivityAction["Updated"] = "updated";
    IActivityAction["Deleted"] = "deleted";
})(IActivityAction || (exports.IActivityAction = IActivityAction = {}));
