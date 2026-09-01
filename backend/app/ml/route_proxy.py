BASE_RATE={'capesize':18.5,'panamax':22.0,'supramax':25.0,'handysize':30.0}
VESSEL_FACTORS={'capesize':1.00,'panamax':1.18,'supramax':1.30,'handysize':1.48}

def route_freight_proxy(bdi:float,vessel_id:str)->float:
    if vessel_id not in BASE_RATE: raise ValueError(f'Unknown vessel_id: {vessel_id}')
    return BASE_RATE[vessel_id]*(max(float(bdi),1.0)/1500.0)**0.55*VESSEL_FACTORS[vessel_id]
