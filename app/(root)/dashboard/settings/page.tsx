"use client"

import React, { useEffect, useRef } from 'react';
import { useState } from "react";
import styles from "./page.module.css";
import { User as UserIcon, Shield, Building, Palette, Lock } from '@/app/components/svg';
import { useFetch } from "@/hooks/useFetch";
import { toast } from 'sonner';
import { Company, User as UserData } from '@/interfaces/interfaces';
import { useAuth } from '@/context/AuthContext';
import { Role, TypeContract } from '@/interfaces/enums';
import SecurityTab from '@/app/components/settings/securitytab/SecurityTab';
import AppTab from '@/app/components/settings/apptab/AppTab';
import AdminTab from '@/app/components/settings/admintab/AdminTab';
import ProfileTab from '@/app/components/settings/profiletab/ProfileTab';

type ModifiedUserData = {
    [K in keyof UserData]?: K extends 'userDetails'
        ? Partial<UserData['userDetails']>
        : UserData[K];
};

const Settings = () =>
{
    const { user } = useAuth();
    const { data, error, isLoading, execute } = useFetch('/api/company', { immediate: false });
    const { data: userData, error: userError, isLoading: userIsLoading, execute: userExecute } = useFetch(`/api/user/${user?.userId}`);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<UserData>>(userData || {});
    const [defaultData, setDefaultData] = useState<Partial<UserData>>(userData || {});
    const [modifiedFields, setModifiedFields] = useState<ModifiedUserData>({});
    const [selectedCompanyImage, setSelectedCompanyImage] = useState<File | null>(null);
    const [previewCompanyImage, setPreviewCompanyImage] = useState<string | null>(null);
    const fileCompanyInputRef = useRef<HTMLInputElement>(null);
    const [companyFormData, setCompanyFormData] = useState<Partial<Company>>(data || {});
    const [defaultCompanyData, setDefaultCompanyData] = useState<Partial<Company>>(data || {});
    const [companyModifiedFields, setCompanyModifiedFields] = useState<Partial<Company>>({});
    const [isEditable, setIsEditable] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [profileImage, setProfileImage] = useState("/user.png");
    const [logoImage, setLogoImage] = useState("/logo.png");

    const [appSettings, setAppSettings] = useState({
        appName: "NovaBites",
        appVersion: "1.0.0",
        theme: "light",
        language: "es",
        notifications: true,
        autoBackup: true,
        sessionTimeout: "30",
    });

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
            return;
        }

        try
        {
            const fetchData = async () =>
            {
                const company = await execute();

                if (company)
                {
                    setCompanyFormData(company[0]);
                    setDefaultCompanyData(company[0]);
                }
            }

            const fetchUserData = async () =>
            {
                const user = await userExecute();

                if (user)
                {
                    setFormData(user);
                    setDefaultData(user);
                }
            }

            fetchData();
            fetchUserData();
        }
        catch (error)
        {
            console.error("Error al cargar los datos:", error);
            toast.error(`Error al cargar los datos: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }, []);

    const isValueChanged = (originalValue: any, newValue: any, fieldPath: string) =>
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

            if (isValueChanged(defaultData.userDetails?.[userDetailsKey as keyof typeof defaultData.userDetails], value, name))
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

            if (isValueChanged(defaultData[name as keyof UserData], value, name))
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
                    return value;
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

        if (preparedData.role) preparedData.role = reverseTransformValue(preparedData.role as string, 'role') as Role;

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

    const handleImageClick = () =>
    {
        if (isEditable && fileInputRef.current) fileInputRef.current.click();
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

                    setIsEditable(false);
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

    const handleImageUpload = (type: "profile" | "logo", event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0];

        if (file)
        {
            const reader = new FileReader();

            reader.onload = (e) =>
            {
                const result = e.target?.result as string;

                if (type === "profile") setProfileImage(result);
                else setLogoImage(result);
            }

            reader.readAsDataURL(file);
        }
    }

    const handleCompanyChange = (e: { target: { name: any; value: any; }; }) =>
    {
        const { name, value } = e.target;

        if (companyFormData) setCompanyFormData({ ...companyFormData, [name]: value });

        if (defaultCompanyData)
        {
            if (isCompanyValueChanged(value, name))
            {
                setCompanyModifiedFields((prev) => ({ ...prev, [name]: value }));
            }
            else
            {
                setCompanyModifiedFields(prev =>
                {
                    const { [name]: removed, ...newModified } = prev as any;
                    return newModified;
                });
            }
        }
    }

    const isCompanyValueChanged = (newValue: any, fieldPath: string) =>
    {
        if (!defaultCompanyData) return false;

        return defaultCompanyData[fieldPath as keyof Company] !== newValue;
    }

    const handleImageCompanyClick = () =>
    {
        if (isEditable && fileCompanyInputRef.current) fileCompanyInputRef.current.click();
    };

    const handleCompanyImageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
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

            setSelectedCompanyImage(file);
            setCompanyModifiedFields((prev) => ({ ...prev, imageFile: true }));

            const reader = new FileReader();
            reader.onload = (e) => setPreviewCompanyImage(e.target?.result as string);
            reader.readAsDataURL(file);

            toast.success("Imagen seleccionada correctamente", {
                description: "La imagen se actualizará cuando guardes los cambios",
                duration: 2000,
                richColors: true,
                position: 'top-right'
            });
        }
    };

    const handleSaveCompanyChanges = async () =>
    {
        try
        {
            const hasFieldChanges = companyModifiedFields && Object.keys(companyModifiedFields).length > 0;
            const hasImageChange = selectedCompanyImage !== null;

            if (hasFieldChanges || hasImageChange)
            {
                const formDataToSend = new FormData();

                Object.keys(companyModifiedFields).forEach(key =>
                {
                    if (key !== 'imageFile')
                    {
                        const value = companyModifiedFields[key as keyof Company];
                        if (value !== undefined && value !== null) formDataToSend.append(key, String(value));
                    }
                });

                if (selectedCompanyImage) formDataToSend.append('image', selectedCompanyImage);

                console.log(formDataToSend);

                const updatedCompany = await execute({
                    method: 'PATCH',
                    body: formDataToSend,
                    isFormData: true
                }, `/api/company/${companyFormData.id}`);

                if (!error && updatedCompany)
                {
                    toast.success("Empresa actualizada correctamente", {
                        description: "Los cambios se han guardado exitosamente.",
                        duration: 3000,
                        richColors: true,
                        position: 'top-right'
                    });

                    const updatedCompanyData = updatedCompany;
                    setIsEditable(false);
                    setCompanyFormData(updatedCompanyData)
                    setDefaultCompanyData(updatedCompanyData);
                    setCompanyModifiedFields({});
                    setSelectedCompanyImage(null);
                    setPreviewCompanyImage(null);
                }
            }
            else
            {
                toast.warning('No hay cambios para guardar', {
                    description: "No se detectaron cambios en los datos de la empresa.",
                    duration: 3000,
                    richColors: true,
                    position: 'top-right'
                });
            }
        }
        catch (error)
        {
            console.error('Error actualizando usuario:', error);
            toast.error(`Error al actualizar el usuario: ${error}`, {
                description: "Por favor, inténtalo de nuevo más tarde.",
                duration: 3000,
                richColors: true,
                position: 'top-right'
            });
        }
    }

    const handleSave = () =>
    {
        console.log("Guardando configuración...");
        setIsEditable(false);
    }

    const handleCancel = async () =>
    {
        if (data)
        {
            const newFetch = await userExecute();
            if (newFetch) setFormData(newFetch);
        }

        setModifiedFields({});
        setIsEditable(false);
        setSelectedCompanyImage(null);
        setPreviewCompanyImage(null);
    };

    const tabs = [
        { id: "profile", label: "Perfil Personal", icon: <UserIcon /> },
        { id: "admin", label: "Datos Empresa", icon: <Building /> },
        { id: "app", label: "Aplicación", icon: <Palette /> },
        { id: "security", label: "Seguridad", icon: <Lock /> },
    ];

    return (
        <div className={styles.settings}>
            <div className={styles.settingsContent}>
                <div className={styles.settingsTabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.settingsPanel}>
                    {activeTab === "profile" && (
                        <ProfileTab
                            isEditable={isEditable}
                            setIsEditable={setIsEditable}
                            handleSaveChanges={handleSaveChanges}
                            handleCancel={handleCancel}
                            handleImageClick={handleImageClick}
                            fileInputRef={fileInputRef}
                            previewImage={previewImage}
                            handleImageChange={handleImageChange}
                            formData={formData}
                            handleChange={handleChange}
                            capitalizeText={capitalizeText}
                        />
                    )}

                    {activeTab === "admin" && (
                        <AdminTab
                            isEditable={isEditable}
                            setIsEditable={setIsEditable}
                            handleSaveCompanyChanges={handleSaveCompanyChanges}
                            handleCancel={handleCancel}
                            handleImageCompanyClick={handleImageCompanyClick}
                            previewCompanyImage={previewCompanyImage}
                            companyFormData={companyFormData}
                            fileCompanyInputRef={fileCompanyInputRef}
                            handleCompanyImageChange={handleCompanyImageChange}
                            handleCompanyChange={handleCompanyChange}
                        />
                    )}

                    {activeTab === "app" && (
                        <AppTab
                            appSettings={appSettings}
                            setAppSettings={setAppSettings}
                            handleSave={handleSave}
                        />
                    )}

                    {activeTab === "security" && (
                        <SecurityTab handleSave={handleSave} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings;