from dataclasses import dataclass

@dataclass(frozen=True)
class Source:
    name: str
    url: str
    kind: str
    notes: str

SOURCES = [
    Source(
        "Australian coal benchmark (IMF/FRED)",
        "https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOALAUUSDM",
        "real",
        "Monthly USD/metric tonne benchmark; IMF Primary Commodity Prices via FRED.",
    ),
    Source(
        "Brent crude benchmark (IMF/FRED)",
        "https://fred.stlouisfed.org/graph/fredgraph.csv?id=POILBREUSDM",
        "real",
        "Monthly USD/barrel benchmark used only as a bunker-cost proxy.",
    ),
    Source(
        "Baltic Dry Index monthly (ÅSUB PxWeb)",
        "https://pxweb.asub.ax/PXWeb/pxweb/en/Statistik/Statistik__TUTRSJ__SJ__Konjunkturstatistik%20för%20sjöfarten/SJ102.px/",
        "real",
        "Monthly BDI, 2011–2025; first business day of each month.",
    ),
    Source(
        "Paradip Port Authority berth specifications",
        "https://paradipport.gov.in/berth-specifications/",
        "real",
        "Official admissible LOA/beam/draft constraints.",
    ),
    Source(
        "Baltic Exchange dry bulk market information",
        "https://www.balticexchange.com/en/data-services/market-information0/dry-services.html",
        "real",
        "Definitions and benchmark vessel assumptions for dry bulk indices.",
    ),
]
