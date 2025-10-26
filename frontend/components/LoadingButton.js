import { useState } from 'react';
import { useRouter } from 'next/router'; // <-- 1. IMPORT ROUTER

/**
 * A button that shows a loading spinner and disables itself while an async onClick is in progress.
 * @param {function} onClick - An async function that MUST return true for success or false for failure.
 * @param {string} [loadingText='Loading...'] - Text to show next to the spinner.
 * @param {string} [className] - Tailwind classes to pass to the button.
 * @param {React.ReactNode} children - The text or content to show when not loading.
 * @param {string} [onSuccessRedirectTo] - The path to redirect to on success.
 */
const LoadingButton = ({
  onClick,
  children,
  className = '', // Default className
  loadingText = 'Loading...', // Default loading text
  onSuccessRedirectTo, // <-- 2. NEW PROP
  ...props // Pass through all other props (like `type`, `disabled`, etc.)
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // <-- 3. Initialize router

  // --- UPDATED handleClick ---
  const handleClick = (e) => {
    // Don't do anything if already loading
    if (isLoading) return;

    // Prevent default form submission behavior if it's a submit button
    if (props.type === 'submit') {
      e.preventDefault();
    }

    // 1. Set loading state *immediately*
    setIsLoading(true);

    // 2. Use setTimeout to push the async task to the next event loop tick.
    setTimeout(async () => {
      let isSuccess = false; // <-- Variable to track success
      try {
        // 3. Await BOTH the original onClick function AND a 2-second delay.
        const [onClickResult, _] = await Promise.all([
          onClick ? onClick(e) : Promise.resolve(true), // Run the onClick
          new Promise(resolve => setTimeout(resolve, 2000)) // Artificial 2-second delay
        ]);
        
        isSuccess = onClickResult; // The onClick (handleSubmit) must return true/false

      } catch (error) {
        // The parent's onClick should handle its own errors (e.g., toast.error)
        console.error("LoadingButton onClick error:", error);
        isSuccess = false;
        setIsLoading(false); // On error, stop loading immediately
      }
      
      // 4. NOW redirect if successful and a path was provided
      if (isSuccess && onSuccessRedirectTo) {
          // Your requested 1-second "page load" delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsLoading(false); // Stop loading *right before* redirect
          router.push(onSuccessRedirectTo);
      } else if (!isSuccess) {
          // If login failed (isSuccess is false), just stop loading
          setIsLoading(false);
      }

    }, 0); // A 0ms timeout is all that's needed to push to the next tick.
  };

  return (
    <button
      onClick={handleClick}
      // Disable if loading OR if the parent explicitly passes `disabled`
      disabled={isLoading || props.disabled} 
      // Pass through all classes, and add loading-specific ones
      className={`flex justify-center items-center transition-opacity duration-200 ${className} ${
        isLoading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      {...props} // Apply all other props (like type="submit")
    >
      {isLoading ? (
        <>
          {/* This is the spinner, styled to match your login button */}
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children // Show the original button text
      )}
    </button>
  );
};

export default LoadingButton;

