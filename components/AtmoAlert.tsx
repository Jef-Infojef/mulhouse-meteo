"use client";

export default function AtmoAlert() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
        Qualité de l'air (Atmo Grand Est)
      </h3>
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <iframe
          src="https://services.atmo-grandest.eu/widget?id=1&theme=light"
          title="Widget qualité de l'air Atmo Grand Est"
          className="w-full h-full border-0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Données: <a href="https://www.atmo-grandest.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Atmo Grand Est</a>
      </p>
    </div>
  );
}
