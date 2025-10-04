import styles from "./signingoogle.module.css";
import { Google } from '@/app/components/svg';

interface SignWithGoogleProps
{
    text?: string
}

const SignWithGoogle = ({text}: SignWithGoogleProps) =>
{
    return (
        <button type="button" className={styles.googlebutton}>
            <Google />
            {text}
        </button>
    );
}

export default SignWithGoogle;