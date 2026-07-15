"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AuthUserDto {
    id;
    name;
    role;
    department;
    status;
    initials;
    accessLevel;
    email;
    photo;
}
exports.AuthUserDto = AuthUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], AuthUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Maria Silva' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Consultor(a)' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Comercial' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ativo' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MS' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "initials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Administrador' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "accessLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'maria@empresa.com' }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://cdn.exemplo.com/foto.jpg', required: false }),
    __metadata("design:type", String)
], AuthUserDto.prototype, "photo", void 0);
//# sourceMappingURL=auth-user.dto.js.map