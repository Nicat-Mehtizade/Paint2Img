import { LuPaintbrush } from "react-icons/lu";

const Header = () => {
  return (
    <div className="bg-black/40 mb-8">
      <div className="max-w-[1400px] mx-auto py-4">
        <div className="flex items-center gap-3">
          <LuPaintbrush className="text-white bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 p-1 rounded-lg"/>
          <p className="text-white text-2xl font-bold">Paint2Img</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
