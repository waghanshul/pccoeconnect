
const EmptyMessageState = () => {
  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
    </div>
  );
};

export default EmptyMessageState;
