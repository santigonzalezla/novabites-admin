"use client"

import React, { RefObject } from 'react';
import styles from '../page.module.css';
import Image from 'next/image';
import { Upload, Edit, Cancel } from '@/app/components/svg';
import { Company } from '@/interfaces/interfaces';

interface AdminTabProps {
    isEditable: boolean;
    setIsEditable: (value: boolean) => void;
    handleSaveCompanyChanges: () => void;
    handleCancel: () => void;
    handleImageCompanyClick: () => void;
    previewCompanyImage: string | null;
    companyFormData: Partial<Company>;
    fileCompanyInputRef: RefObject<HTMLInputElement | null>;
    handleCompanyImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCompanyChange: (e: { target: { name: any; value: any; }; }) => void;
}

const AdminTab: React.FC<AdminTabProps> = ({ isEditable, setIsEditable, handleSaveCompanyChanges, handleCancel, handleImageCompanyClick, previewCompanyImage, companyFormData, fileCompanyInputRef, handleCompanyImageChange, handleCompanyChange }) =>
{
    return (
        <div className={styles.adminSection}>
            <div className={styles.sectionTitle}>
                <h2>Datos de la Empresa</h2>
                {!isEditable ? (
                    <button className={styles.editButton} onClick={() => setIsEditable(true)}>
                        <Edit />
                        Editar Campos
                    </button>
                ) : (
                    <div className={styles.editActions}>
                        <button className={styles.saveButton} onClick={handleSaveCompanyChanges}>
                            Guardar Cambios
                        </button>
                        <button className={styles.cancelButton} onClick={handleCancel}>
                            <Cancel />
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.logoSection}>
                <div className={styles.imageContainer}>
                    <div
                        className={`${styles.productImage} ${!isEditable ? styles.productImageSelector : ''}`}
                        onClick={isEditable ? handleImageCompanyClick : undefined}
                        style={{ cursor: isEditable ? 'pointer' : 'default' }}
                    >
                        <Image
                            src={previewCompanyImage || companyFormData?.imageUrl || "/placeholder.svg"}
                            alt="Logo de la empresa"
                            width={150}
                            height={100}
                            className={styles.logoImg}
                        />
                        {isEditable && (
                            <div className={styles.imageOverlay}>
                                <span>Click para cambiar imagen</span>
                            </div>
                        )}
                    </div>
                    {isEditable && (
                        <label className={styles.imageUpload}>
                            <Upload />
                            <input
                                type="file"
                                ref={fileCompanyInputRef}
                                onChange={handleCompanyImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>
                <div className={styles.imageInfo}>
                    <h3>Logo de la Empresa</h3>
                    <p>Sube el logo de tu empresa. Se mostrará en el sidebar y documentos.</p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Nombre de la Empresa</label>
                    <input
                        id="name"
                        name="name"
                        disabled={!isEditable}
                        type="text"
                        value={companyFormData?.name || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Nombre Comercial</label>
                    <input
                        id="tradeName"
                        name="tradeName"
                        disabled={!isEditable}
                        type="text"
                        value={companyFormData?.tradeName || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="docId">Documento</label>
                    <div className={styles.idList}>
                        <select
                            id="typeId"
                            name="typeId"
                            className={styles.idSelect}
                            disabled={!isEditable}
                            value={companyFormData?.typeId || 'NIT'}
                            onChange={handleCompanyChange}
                        >
                            <option value="CC">CC</option>
                            <option value="NIT">NIT</option>
                        </select>
                        <input
                            id="docId"
                            name="docId"
                            value={companyFormData?.docId || ''}
                            onChange={handleCompanyChange}
                            disabled={!isEditable}
                            className={styles.idInput}
                        />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Tipo de Negocio</label>
                    <select
                        id="regimen"
                        name="regimen"
                        disabled={!isEditable}
                        value={companyFormData?.regimen || ''}
                        onChange={handleCompanyChange}
                    >
                        <option value="Regimen Común">Regimen Común</option>
                        <option value="Regimen Simplificado">Regimen Simplificado</option>
                        <option value="Regimen Especial">Regimen Especial</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Actividad Económica:</label>
                    <input
                        id="economicActivity"
                        name="economicActivity"
                        type="text"
                        disabled={!isEditable}
                        value={companyFormData?.economicActivity || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Dirección</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        disabled={!isEditable}
                        value={companyFormData?.address || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Ciudad</label>
                    <input
                        id="city"
                        name="city"
                        type="text"
                        disabled={!isEditable}
                        value={companyFormData?.city || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Código Postal</label>
                    <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        disabled={!isEditable}
                        value={companyFormData?.postalCode || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        disabled={!isEditable}
                        value={companyFormData?.phone || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        disabled={!isEditable}
                        value={companyFormData?.email || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Sitio Web</label>
                    <input
                        id="website"
                        name="website"
                        type="url"
                        disabled={!isEditable}
                        value={companyFormData?.website || ''}
                        onChange={handleCompanyChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminTab;