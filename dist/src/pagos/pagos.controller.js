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
exports.PagosController = void 0;
const common_1 = require("@nestjs/common");
const pagos_service_1 = require("./pagos.service");
const platform_express_1 = require("@nestjs/platform-express");
const auth_guard_1 = require("../auth/auth.guard");
let PagosController = class PagosController {
    pagosService;
    constructor(pagosService) {
        this.pagosService = pagosService;
    }
    async uploadExcel(file) {
        if (!file) {
            return { message: 'No file uploaded' };
        }
        const results = await this.pagosService.processExcel(file.buffer);
        return { message: 'Archivo procesado con éxito', count: results.length };
    }
    async getPersonas() {
        return this.pagosService.getAllPersonas();
    }
    async generateDocs(body, res) {
        const { dnis } = body;
        if (!dnis || dnis.length === 0) {
            return res.status(400).send({ message: 'No se enviaron DNIs' });
        }
        try {
            const result = await this.pagosService.generateDocuments(dnis);
            if (result.type === 'single') {
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${result.filename}"`,
                });
            }
            else {
                res.set({
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="${result.filename}"`,
                });
            }
            res.send(result.buffer);
        }
        catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
};
exports.PagosController = PagosController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "uploadExcel", null);
__decorate([
    (0, common_1.Get)('personas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "getPersonas", null);
__decorate([
    (0, common_1.Post)('generar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "generateDocs", null);
exports.PagosController = PagosController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('pagos'),
    __metadata("design:paramtypes", [pagos_service_1.PagosService])
], PagosController);
//# sourceMappingURL=pagos.controller.js.map