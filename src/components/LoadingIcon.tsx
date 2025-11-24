import Lottie from 'lottie-react';

import lumiLoading from '../assets/animations/loading.json';

export function LoadingIcon() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
      <div className="w-48 h-48">
        <Lottie animationData={lumiLoading} loop={true} />
      </div>
    </div>
  );
}
