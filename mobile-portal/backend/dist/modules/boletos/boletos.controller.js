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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoletosController = void 0;
const common_1 = require("@nestjs/common");
const boletos_service_1 = require("./boletos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BoletosController = class BoletosController {
    boletosService;
    constructor(boletosService) {
        this.boletosService = boletosService;
    }
    async getAll(req) {
        return this.boletosService.getBoletosByCliente(req.user.clienteId);
    }
    async getResumo(req) {
        return this.boletosService.getResumo(req.user.clienteId);
    }
    async getAbertos(req) {
        return this.boletosService.getBoletosAbertos(req.user.clienteId);
    }
    async getPagos(req) {
        return this.boletosService.getBoletosPagos(req.user.clienteId);
    }
    async getById(req, id) {
        return this.boletosService.getBoletoById(req.user.clienteId, id);
    }
};
exports.BoletosController = BoletosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoletosController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('resumo'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoletosController.prototype, "getResumo", null);
__decorate([
    (0, common_1.Get)('abertos'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoletosController.prototype, "getAbertos", null);
__decorate([
    (0, common_1.Get)('pagos'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BoletosController.prototype, "getPagos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BoletosController.prototype, "getById", null);
exports.BoletosController = BoletosController = __decorate([
    (0, common_1.Controller)('boletos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [boletos_service_1.BoletosService])
], BoletosController);
//# sourceMappingURL=boletos.controller.js.map