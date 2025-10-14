'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './userdetails.module.css';
import Image from 'next/image';
import { Company, User as UserData } from '@/interfaces/interfaces';
import { Camera, Cancel, DeleteUser, EditUser, Key, Options, Upload } from '@/app/components/svg';
import { useFetch } from '@/hooks/useFetch';
import { usePathname } from 'next/navigation';
import { Role, TypeContract, TypeId } from '@/interfaces/enums';
import { toast } from 'sonner';

type ModifiedUserData = {
    [K in keyof UserData]?: K extends 'userDetails'
        ? Partial<UserData['userDetails']>
        : UserData[K];
};

const UserDetails = () =>
{
    const pathname = usePathname();
    const userId = pathname.split('/').pop();
    const { data, error, execute } = useFetch<UserData>(`/api/user/${userId}`);
    const [isEditing, setIsEditing] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<UserData>>(data || {});
    const [defaultData, setDefaultData] = useState<Partial<UserData>>(data || {});
    const [modifiedFields, setModifiedFields] = useState<ModifiedUserData>({});
    const [profileImage, setProfileImage] = useState("/user.png");

    useEffect(() =>
    {
        if (error)
        {
            console.error("Error al cargar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
        try
        {

            const fetchData = async () =>
            {
                const user = await execute();

                if (user)
                {
                    setFormData(user);
                    setDefaultData(user);
                    setModifiedFields({});
                }
            }

            fetchData();
        }
        catch (error)
        {
            console.error('Error al procesar los datos:', error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const selectOptions = {
        storeId: ['STR-001', 'STR-002', 'STR-003', 'STR-004'],
        status: ['Activo', 'Inactivo'],
    };

    const isValueChanged = (newValue: any, fieldPath: string) =>
    {
        if (fieldPath.startsWith('userDetails.'))
        {
            const userDetailsKey = fieldPath.split('.')[1];
            const defaultValue = defaultData.userDetails?.[userDetailsKey as keyof typeof defaultData.userDetails];

            return defaultValue !== newValue;
        }

        return defaultData[fieldPath as keyof UserData] !== newValue;
    }

    const handleChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (name.startsWith('userDetails.'))
        {
            const userDetailsKey = name.split('.')[1];

            if (formData.userDetails) setFormData({ ...formData, userDetails: { ...formData.userDetails, [userDetailsKey]: value } });

            if (isValueChanged(value, name))
            {
                setModifiedFields((prev) => ({
                    ...prev,
                    userDetails: { ...(prev.userDetails || {}), [userDetailsKey]: value } as Partial<UserData['userDetails']>
                }));
            }
            else
            {
                setModifiedFields((prev) =>
                {
                    const newModified = { ...prev };

                    if (newModified.userDetails)
                    {
                        const { [userDetailsKey]: removed, ...rest } = newModified.userDetails as any;

                        if (Object.keys(rest).length === 0)
                        {
                            const { userDetails: removedUserDetails, ...finalResult } = newModified;
                            return finalResult;
                        }
                        else
                        {
                            return { ...newModified, userDetails: rest };
                        }
                    }
                    return newModified;
                });
            }
        }
        else
        {
            if (formData) setFormData({ ...formData, [name]: value });

            if (isValueChanged(value, name))
            {
                setModifiedFields((prev) => ({
                    ...prev,
                    [name]: value
                }));
            }
            else
            {
                setModifiedFields(prev =>
                {
                    const { [name]: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    };

    const transformValue = (value: Role | TypeContract | undefined) =>
    {
        switch (value)
        {
            case Role.ADMIN:
                return 'Administrador';
            case Role.MANAGER:
                return 'Gerente';
            case Role.USER:
                return 'Usuario';
            case TypeContract.INDEFINITE:
                return 'Termino Indefinido';
            case TypeContract.FIXED_TERM:
                return 'Termino Fijo';
            case TypeContract.INTERNSHIP:
                return 'Prácticas';
            case TypeContract.TEMPORARY:
                return 'Temporal';
            case TypeContract.PART_TIME:
                return 'Medio Tiempo';
            default:
                return value;
        }
    }

    const reverseTransformValue = (value: string, fieldType: 'role' | 'typeContract' | 'date'): any =>
    {
        if (fieldType === 'role')
        {
            switch (value)
            {
                case 'Administrador':
                    return Role.ADMIN;
                case 'Gerente':
                    return Role.MANAGER;
                case 'Usuario':
                    return Role.USER;
                default:
                    return value; // Si ya está en formato enum
            }
        }

        if (fieldType === 'typeContract')
        {
            switch (value)
            {
                case 'Termino Indefinido':
                    return TypeContract.INDEFINITE;
                case 'Termino Fijo':
                    return TypeContract.FIXED_TERM;
                case 'Prácticas':
                    return TypeContract.INTERNSHIP;
                case 'Temporal':
                    return TypeContract.TEMPORARY;
                case 'Medio Tiempo':
                    return TypeContract.PART_TIME;
                default:
                    return value;
            }
        }

        if (fieldType === 'date') return new Date(value).toISOString();

        return value;
    };

    const capitalizeText = (text: string) =>
    {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const prepareDataForPatch = (modifiedData: ModifiedUserData): ModifiedUserData =>
    {
        const preparedData = { ...modifiedData };

        // Convertir role si existe
        if (preparedData.role) preparedData.role = reverseTransformValue(preparedData.role as string, 'role') as Role;

        // Convertir campos de userDetails si existen
        if (preparedData.userDetails)
        {
            const userDetails = { ...preparedData.userDetails };

            if (userDetails.typeContract) userDetails.typeContract = reverseTransformValue(userDetails.typeContract as string, 'typeContract') as TypeContract;
            if (userDetails.birthDate) userDetails.birthDate = reverseTransformValue(userDetails.birthDate as string, 'date');
            if (userDetails.position) userDetails.position = userDetails.position.toUpperCase();

            preparedData.userDetails = userDetails;
        }

        return preparedData;
    };

    const handleImageUpload = (type: "profile" | "logo", event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        if (file)
        {
            const reader = new FileReader();

            reader.onload = (e) =>
            {
                const result = e.target?.result as string;

                setProfileImage(result);
            }

            reader.readAsDataURL(file);
        }
    }

    const handleImageClick = () =>
    {
        if (isEditing && fileInputRef.current) fileInputRef.current.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        if (file)
        {
            if (!file.type.startsWith('image/'))
            {
                toast.error("Por favor selecciona un archivo de imagen válido", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024)
            {
                toast.error("La imagen debe ser menor a 5MB", {
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
                return;
            }

            setSelectedImage(file);
            setModifiedFields((prev) => ({ ...prev, imageFile: true }));

            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target?.result as string);
            reader.readAsDataURL(file);

            toast.success("Imagen seleccionada correctamente", {
                description: "La imagen se actualizará cuando guardes los cambios",
                duration: 2000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleSaveChanges = async () =>
    {
        try
        {
            const hasFieldChanges = modifiedFields && Object.keys(modifiedFields).length > 0;
            const hasImageChange = selectedImage !== null;

            if (hasFieldChanges || hasImageChange)
            {
                let bodyData: any;
                let isFormData = false;

                if (hasImageChange)
                {
                    const formDataToSend = new FormData();

                    const preparedData = prepareDataForPatch(modifiedFields);

                    Object.keys(preparedData).forEach(key =>
                    {
                        if (key !== 'imageFile' && key !== 'userDetails')
                        {
                            const value = preparedData[key as keyof typeof preparedData];

                            if (value !== undefined && value !== null) formDataToSend.append(key, String(value));
                        }
                    });

                    if (preparedData.userDetails) formDataToSend.append('userDetails', JSON.stringify(preparedData.userDetails));

                    formDataToSend.append('image', selectedImage);

                    bodyData = formDataToSend;
                    isFormData = true;
                }
                else
                {
                    bodyData = prepareDataForPatch(modifiedFields);
                    isFormData = false;
                }

                console.log('Datos a enviar:', bodyData);

                const updatedUser = await execute({
                    method: 'PATCH',
                    body: bodyData,
                    isFormData: isFormData
                }, `/api/user/${formData.id}`);

                if (!error && updatedUser)
                {
                    toast.success("Usuario actualizado correctamente", {
                        description: "Los cambios se han guardado exitosamente.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });

                    setIsEditing(false);
                    setFormData(updatedUser)
                    setDefaultData(updatedUser);
                    setModifiedFields({});
                    setSelectedImage(null);
                    setPreviewImage(null);
                }
            }
            else
            {
                toast.warning('No hay cambios para guardar', {
                    description: "No se detectaron cambios en los datos del usuario.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (e)
        {
            console.error('Error actualizando usuario:', e);
            toast.error(`Error al actualizar el usuario: ${e}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleGeneratePassword = () =>
    {
        const randomPassword = Math.random().toString(36).slice(-8);
        alert(`Nueva contraseña generada: ${randomPassword}`);
    };

    // Función para eliminar usuario
    const handleDeleteUser = () =>
    {
        if (confirm('¿Está seguro que desea eliminar este usuario?'))
        {
            alert('Usuario eliminado');
        }
    };

    const handleCancel = async () =>
    {
        if (data) {
            const newFetch = await execute();
            if (newFetch) setFormData(newFetch);
        }
        setModifiedFields({});
        setIsEditing(false);
    };
    
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileContent}>
                <div className={styles.profileHeader}>
                    <div className={styles.imageContainer}>
                        <div
                            className={`${styles.productImage} ${!isEditing ? styles.productImageSelector : ''}`}
                            onClick={isEditing ? handleImageClick : undefined}
                            style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        >
                            <Image
                                src={previewImage || formData?.userDetails?.imageUrl || "/user.png"}
                                alt="user img"
                                width={150}
                                height={150}
                                className={styles.logoImg}
                            />
                            {isEditing && (
                                <div className={styles.imageOverlay}>
                                    <span>Haz click para cambiar la imagen</span>
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label
                                className={`${styles.imageUpload} ${isEditing ? styles.imageUploadEnabled : ''}`}
                            >
                                <Upload />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={!isEditing}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>

                    <div className={styles.optionsContainer}>
                        {!isEditing ? (
                            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                                <EditUser />
                                Editar Perfil
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.saveButton} onClick={handleSaveChanges}>
                                    Guardar
                                </button>
                                <button className={styles.cancelButton} onClick={handleCancel}>
                                    <Cancel />
                                    Cancelar
                                </button>
                            </div>
                        )}

                        <button className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
                            <Options />
                        </button>

                        {showOptions && (
                            <div className={styles.optionsMenu}>
                                <button className={styles.optionItem} onClick={handleGeneratePassword}>
                                    <Key />
                                    Generar Contraseña
                                </button>
                                <button className={styles.optionItem} onClick={handleDeleteUser}>
                                    <DeleteUser />
                                    Eliminar Usuario
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <form className={styles.form}>
                        {/* Sección 1: Personal Information */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Información del Usuario</h2>
                            <div className={styles.sectionContent}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name" className={styles.label}>
                                            Nombre Completo
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email" className={styles.label}>
                                            Correo Electrónico
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone" className={styles.label}>
                                            Teléfono
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="docId" className={styles.label}>
                                            Documento
                                        </label>
                                        <div className={styles.idList}>
                                            <select
                                                className={styles.idSelect}
                                                disabled={!isEditing}
                                            >
                                                <option value="CC">CC</option>
                                                <option value="NIT">NIT</option>
                                                <option value="CE">CE</option>
                                                <option value="TI">TI</option>
                                                <option value="PP">PP</option>
                                            </select>
                                            <input
                                                id="docId"
                                                name="docId"
                                                value={formData.docId || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className={styles.idInput}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="userDetails.birthDate" className={styles.label}>
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            id="userDetails.birthDate"
                                            name="userDetails.birthDate"
                                            type="date"
                                            value={formData.userDetails?.birthDate ? new Date(formData.userDetails.birthDate).toISOString().split('T')[0] : ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionContent}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="role" className={styles.label}>
                                            Rol
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={transformValue(formData.role) || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.select}
                                        >
                                            {Object.values(Role).map((roleValue) => (
                                                <option key={roleValue} value={transformValue(roleValue)}>
                                                    {transformValue(roleValue)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="storeId" className={styles.label}>
                                            Tienda
                                        </label>
                                        <select
                                            id="storeId"
                                            name="storeId"
                                            value={formData.storeId || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.select}
                                        >
                                            {selectOptions.storeId.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="status" className={styles.label}>
                                            Estado
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.select}
                                        >
                                            {selectOptions.status.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionContent}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="userDetails.position" className={styles.label}>
                                            Cargo
                                        </label>
                                        <input
                                            id="userDetails.position"
                                            name="userDetails.position"
                                            value={formData.userDetails?.position ? capitalizeText(formData.userDetails?.position) : ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="userDetails.contractType" className={styles.label}>
                                            Tipo de Contrato
                                        </label>
                                        <select
                                            id="userDetails.typeContract"
                                            name="userDetails.typeContract"
                                            value={formData.userDetails?.typeContract || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.select}
                                        >
                                            {Object.values(TypeContract).map((contractValue) => (
                                                <option key={contractValue} value={contractValue}>
                                                    {transformValue(contractValue)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="userDetails.city" className={styles.label}>
                                            Ciudad
                                        </label>
                                        <input
                                            id="userDetails.city"
                                            name="userDetails.city"
                                            value={formData.userDetails?.city || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="userDetails.address" className={styles.label}>
                                            Dirección
                                        </label>
                                        <input
                                            id="userDetails.address"
                                            name="userDetails.address"
                                            value={formData.userDetails?.address || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;