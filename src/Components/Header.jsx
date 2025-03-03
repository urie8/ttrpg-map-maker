import { useNavigate } from "react-router-dom";

function Header({ page }) {
  const navigate = useNavigate();

  function onClicked(route) {
    navigate(route); // Navigera till den valda sidan
  }

  return (
    <div className="header h-32 bg-top bg-violet-300 shadow-sm">
      <div className="header-title">
        <h3
          className="text-3xl py-5 font-serif cursor-pointer hover:text-violet-600"
          onClick={() => onClicked("/")}
        >
          TTRPG MAP MAKER
        </h3>
        <button
          className="route-btn cursor-pointer w-24 rounded-full  shadow-sm bg-violet-500 hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
          onClick={() => onClicked("/bsp")}
        >
          BSP
        </button>
        <button
          className="route-btn cursor-pointer ml-2 w-24 rounded-full shadow-sm bg-violet-500 hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
          onClick={() => onClicked("/simplex")}
        >
          Simplex
        </button>
      </div>
    </div>
  );
}

export default Header;
