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
const create_persona_dto_1 = require("./dto/create-persona.dto");
const update_persona_dto_1 = require("./dto/update-persona.dto");
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
    async createPersona(data) {
        return this.pagosService.createPersona(data);
    }
    async toggleStatus(dni, activo) {
        return this.pagosService.togglePersonaStatus(dni, activo);
    }
    async updatePersona(dni, data) {
        return this.pagosService.updatePersona(dni, data);
    }
    async deletePersona(dni) {
        return this.pagosService.deletePersona(dni);
    }
    async exportarExcel(res) {
        const buffer = await this.pagosService.exportToExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Personas.xlsx"',
        });
        res.send(buffer);
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
    (0, common_1.Post)('persona'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_persona_dto_1.CreatePersonaDto]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "createPersona", null);
__decorate([
    (0, common_1.Patch)('persona/:dni/status'),
    __param(0, (0, common_1.Param)('dni')),
    __param(1, (0, common_1.Body)('activo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Patch)('persona/:dni'),
    __param(0, (0, common_1.Param)('dni')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_persona_dto_1.UpdatePersonaDto]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "updatePersona", null);
__decorate([
    (0, common_1.Delete)('persona/:dni'),
    __param(0, (0, common_1.Param)('dni')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "deletePersona", null);
__decorate([
    (0, common_1.Get)('exportar'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PagosController.prototype, "exportarExcel", null);
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