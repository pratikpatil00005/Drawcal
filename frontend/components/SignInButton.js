import authService from '../../backend/services/authService';

export default function SignInButton() {
    const handleSignIn = async () => {
        try {
            await authService.signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    return (
        <button 
            onClick={handleSignIn}
            className="sign-in-button">
            Sign in with Google
        </button>
    );
}
