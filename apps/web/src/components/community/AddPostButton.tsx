"use client";

import { useFormStatus } from "react-dom";

const AddPostButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-violet-900 text-white font-medium p-2 mt-2 rounded-md disabled:bg-violet-900/50 disabled:cursor-not-allowed hover:bg-violet-900/90"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-white-300 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          Sending
        </div>
      ) : (
        "Send"
      )}
    </button>
  );
};

export default AddPostButton;