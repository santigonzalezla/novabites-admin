"use client"

import React, { RefObject } from 'react';
import styles from '../page.module.css';
import Image from 'next/image';
import { Camera, Edit, Cancel, Upload } from '@/app/components/svg';
import { User as UserData } from '@/interfaces/interfaces';

interface ProfileTabProps {
    isEditable: boolean;
    setIsEditable: (value: boolean) => void;
    handleImageClick: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    previewImage: string | null;
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveChanges: () => void;
    handleCancel: () => void;
    formData: Partial<UserData>;
    handleChange: (e: { target: { name: any; value: any; }; }) => void;
    capitalizeText: (text: string) => string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ isEditable, setIsEditable, handleSaveChanges, handleCancel, handleImageClick, fileInputRef, previewImage, handleImageChange, formData, handleChange, capitalizeText }) =>
{
    return (
        <div className={styles.profileSection}>
            <div className={styles.sectionTitle}>
                <h2>Configuración del Perfil</h2>
                {!isEditable ? (
                    <button className={styles.editButton} onClick={() => setIsEditable(true)}>
                        <Edit />
                        Editar Campos
                    </button>
                ) : (
                    <div className={styles.editActions}>
                        <button className={styles.saveButton} onClick={handleSaveChanges}>
                            Guardar Cambios
                        </button>
                        <button className={styles.cancelButton} onClick={handleCancel}>
                            <Cancel />
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.profileImageSection}>
                <div className={styles.imageContainer}>
                    <div
                        className={`${styles.productImage} ${!isEditable ? styles.productImageSelector : ''}`}
                        onClick={isEditable ? handleImageClick : undefined}
                        style={{ cursor: isEditable ? 'pointer' : 'default' }}
                    >
                        <Image
                            src={previewImage || formData?.userDetails?.imageUrl || "/user.png"}
                            alt="user img"
                            width={150}
                            height={150}
                            className={styles.logoImg}
                        />
                        {isEditable && (
                            <div className={styles.imageOverlay}>
                                <span>Haz click para cambiar la imagen</span>
                            </div>
                        )}
                    </div>
                    {isEditable && (
                        <label className={styles.imageUpload}>
                            <Upload />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>
                <div className={styles.imageInfo}>
                    <h3>Foto de Perfil</h3>
                    <p>Sube una imagen de perfil. Recomendamos una imagen cuadrada de al menos 200x200px.</p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        name="name"
                        disabled={!isEditable}
                        type="text"
                        value={formData?.name || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="docId">Documento</label>
                    <div className={styles.idList}>
                        <select
                            id="typeId"
                            name="typeId"
                            value={formData?.typeId || 'CC'}
                            onChange={handleChange}
                            className={styles.idSelect}
                            disabled={!isEditable}
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
                            value={formData?.docId || ''}
                            onChange={handleChange}
                            disabled={!isEditable}
                            className={styles.idInput}
                        />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        disabled={!isEditable}
                        type="email"
                        value={formData?.email || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">Teléfono</label>
                    <input
                        id="phone"
                        name="phone"
                        disabled={!isEditable}
                        type="tel"
                        value={formData?.phone || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="userDetails.position">Cargo</label>
                    <input
                        id="userDetails.position"
                        name="userDetails.position"
                        disabled={!isEditable}
                        type="text"
                        value={formData.userDetails?.position ? capitalizeText(formData.userDetails?.position) : ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="userDetails.city">Ciudad</label>
                    <input
                        id="userDetails.city"
                        name="userDetails.city"
                        disabled={!isEditable}
                        type="text"
                        value={formData.userDetails?.city || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="userDetails.birthDate">Fecha de Nacimiento</label>
                    <input
                        disabled={!isEditable}
                        id="userDetails.birthDate"
                        name="userDetails.birthDate"
                        type="date"
                        value={formData.userDetails?.birthDate ? new Date(formData.userDetails.birthDate).toISOString().split('T')[0] : ''}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="userDetails.address">Dirección</label>
                    <input
                        id="userDetails.address"
                        name="userDetails.address"
                        disabled={!isEditable}
                        type="text"
                        value={formData.userDetails?.address || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;