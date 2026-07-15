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
exports.DestinationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const destination_service_1 = require("./destination.service");
const destination_dto_1 = require("./dto/destination.dto");
const destination_param_dto_1 = require("./dto/destination-param.dto");
const list_destinations_query_dto_1 = require("./dto/list-destinations-query.dto");
let DestinationController = class DestinationController {
    destinationService;
    constructor(destinationService) {
        this.destinationService = destinationService;
    }
    findAll(query) {
        return this.destinationService.findAll(query);
    }
    findOne(params) {
        return this.destinationService.findOne(params.id);
    }
};
exports.DestinationController = DestinationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista destinos' }),
    (0, swagger_1.ApiOkResponse)({ type: destination_dto_1.DestinationDto, isArray: true }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_destinations_query_dto_1.ListDestinationsQueryDto]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um destino por id' }),
    (0, swagger_1.ApiOkResponse)({ type: destination_dto_1.DestinationDto }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [destination_param_dto_1.DestinationParamDto]),
    __metadata("design:returntype", Promise)
], DestinationController.prototype, "findOne", null);
exports.DestinationController = DestinationController = __decorate([
    (0, swagger_1.ApiTags)('Destinations'),
    (0, common_1.Controller)('destinations'),
    __metadata("design:paramtypes", [destination_service_1.DestinationService])
], DestinationController);
//# sourceMappingURL=destination.controller.js.map