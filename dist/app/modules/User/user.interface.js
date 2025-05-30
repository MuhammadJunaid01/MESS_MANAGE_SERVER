"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "Admin";
    UserRole["Member"] = "Member";
    UserRole["Buyer"] = "Buyer";
    UserRole["UtilityManager"] = "UtilityManager";
    UserRole["MealManager"] = "MealManager";
    UserRole["Viewer"] = "Viewer";
    UserRole["Manager"] = "Manager";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["Male"] = "Male";
    Gender["Female"] = "Female";
    Gender["NonBinary"] = "Non-Binary";
    Gender["Other"] = "Other";
    Gender["PreferNotToSay"] = "PreferNotToSay";
})(Gender || (exports.Gender = Gender = {}));
