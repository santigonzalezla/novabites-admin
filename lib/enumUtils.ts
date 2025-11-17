import {
    Role,
    TypeId,
    TypeIdBusiness,
    TypeStore,
    TypeContract,
    UnitType,
    StatusOrder,
    StockMovementType,
    LogLevel,
    LogContext,
    ActionType,
    RequestType,
    RequestStatus,
    ReturnReason,
    ExpenseCategory
} from '@/interfaces/enums';

const enumLabelTranslations: Record<string, string> = {
    // Role
    'ADMIN': 'Administrador',
    'MANAGER': 'Gerente',
    'USER': 'Usuario',
    'MANUFACTURER': 'Fabricante',
    'COURIER': 'Repartidor',

    // TypeStore
    'PRINCIPAL': 'Principal',
    'NORMAL': 'Normal',
    'DISTRIBUTION': 'Distribución',

    // TypeId & TypeIdBusiness
    'CC': 'Cédula de Ciudadanía',
    'NIT': 'NIT',
    'TI': 'Tarjeta de Identidad',
    'CE': 'Cédula de Extranjería',
    'PP': 'Pasaporte',

    // TypeContract
    'INDEFINITE': 'Indefinido',
    'FIXED_TERM': 'Término Fijo',
    'INTERNSHIP': 'Pasantía',
    'TEMPORARY': 'Temporal',
    'PART_TIME': 'Medio Tiempo',

    // UnitType
    'KG': 'Kilogramos (kg)',
    'L': 'Litros (L)',
    'UN': 'Unidades',
    'GRAM': 'Gramos (g)',
    'ML': 'Mililitros (ml)',
    'LB': 'Libras (lb)',

    // StatusOrder
    'PENDING': 'Pendiente',
    'COMPLETED': 'Completado',
    'CANCELED': 'Cancelado',

    // StockMovementType
    'ALLOCATION': 'Asignación',
    'RETURN': 'Devolución',
    'ADJUSTMENT': 'Ajuste',
    'SALE': 'Venta',
    'LOSS': 'Pérdida',

    // LogLevel
    'DEBUG': 'Depuración',
    'INFO': 'Información',
    'WARN': 'Advertencia',
    'ERROR': 'Error',
    'FATAL': 'Fatal',

    // LogContext
    'AUTH': 'Autenticación',
    'USER_MANAGEMENT': 'Gestión de Usuarios',
    'INVENTORY': 'Inventario',
    'SALES': 'Ventas',
    'ORDERS': 'Órdenes',
    'BILLING': 'Facturación',
    'DELIVERY': 'Entrega',
    'SYSTEM': 'Sistema',
    'SECURITY': 'Seguridad',

    // ActionType
    'CREATE': 'Crear',
    'READ': 'Leer',
    'UPDATE': 'Actualizar',
    'DELETE': 'Eliminar',
    'LOGIN': 'Iniciar Sesión',
    'LOGOUT': 'Cerrar Sesión',
    'EXPORT': 'Exportar',
    'IMPORT': 'Importar',
    'BACKUP': 'Respaldo',
    'RESTORE': 'Restaurar',

    // RequestType
    'SUPPLY_REQUEST': 'Abastecimiento',
    'RETURN_REQUEST': 'Devolución',
    'RELOCATION_REQUEST': 'Reubicación',

    // RequestStatus
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado',
    'IN_PROGRESS': 'En Progreso',

    // ReturnReason
    'DAMAGED': 'Dañado',
    'EXPIRED': 'Vencido',
    'INCORRECT': 'Incorrecto',
    'EXCESS_STOCK': 'Exceso de Stock',
    'OTHER': 'Otro',

    // ExpenseCategory
    'RENT': 'Arriendo',
    'UTILITIES': 'Servicios Públicos',
    'SERVICES': 'Servicios',
    'MAINTENANCE': 'Mantenimiento',
    'SUPPLIES': 'Suministros',

    // Estados genéricos
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
};

export const fieldToEnumMap: Record<string, Record<string, string>> = {
    'role': Role,
    'typeId': TypeId,
    'typeIdBusiness': TypeIdBusiness,
    'type': TypeStore,
    'typeContract': TypeContract,
    'unit': UnitType,
    'statusOrder': StatusOrder,
    'stockMovementType': StockMovementType,
    'logLevel': LogLevel,
    'logContext': LogContext,
    'actionType': ActionType,
    'requestType': RequestType,
    'status': RequestStatus,
    'returnReason': ReturnReason,
    'category': ExpenseCategory,
};

export const formatEnumLabel = (key: string): string =>
{
    return enumLabelTranslations[key] || key
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const enumToSelectOptions = (enumObj: Record<string, string>) =>
{
    return Object.values(enumObj).map(value => ({ value: value, label: formatEnumLabel(value) }));
};

export const getSelectOptionsForField = (fieldName: string) =>
{
    const enumObj = fieldToEnumMap[fieldName];

    if (!enumObj)
    {
        console.warn(`No enum found for field: ${fieldName}`);
        return [];
    }

    return enumToSelectOptions(enumObj);
};

export const labelToEnumValue = (label: string): string =>
{
    const entry = Object.entries(enumLabelTranslations).find(
        ([_, translation]) => translation === label
    );
    return entry ? entry[0] : label;
};

export const enumValueToLabel = (value: string): string => formatEnumLabel(value);

export const getAllEnums = () =>
{
    return {
        Role,
        TypeId,
        TypeIdBusiness,
        TypeStore,
        TypeContract,
        UnitType,
        StatusOrder,
        StockMovementType,
        LogLevel,
        LogContext,
        ActionType,
        RequestType,
        RequestStatus,
        ReturnReason,
        ExpenseCategory
    };
};

export const isValidEnumValue = (fieldName: string, value: string): boolean =>
{
    const enumObj = fieldToEnumMap[fieldName];
    if (!enumObj) return false;

    return Object.values(enumObj).includes(value);
};