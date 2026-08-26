# Constants for FreightIQ Calculations

DEFAULT_COMMODITY = "Coal"
DEFAULT_ORIGIN = "newcastle"
DEFAULT_DESTINATION = "paradip"
DEFAULT_PARCEL_SIZE = 70000.0  # in Metric Tons
DEFAULT_VOYAGES = 4

# Demurrage rates per day per vessel class (USD/day)
DAILY_DEMURRAGE_RATES = {
    "capesize": 38000.0,
    "panamax": 22000.0,
    "supramax": 18500.0,
    "handysize": 14000.0
}
