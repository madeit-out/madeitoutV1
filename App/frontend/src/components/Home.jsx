
function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 max-w-2xl">
        ARE YOU READY TO PLAN A TRIP FOR YOU AND YOUR FRIENDS, FAMILY, COWORKERS, WHOEVER?
      </h1>

      <div className="bg-black text-white py-4 px-8 rounded-full shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href="/signin" className="text-white hover:underline text-lg font-medium">
            SIGN IN
          </a>
          <a href="/signup" className="text-white hover:underline text-lg font-medium">
            CREATE ACCOUNT
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;

