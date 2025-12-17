// Excel Column  --->  FanVariant Field
export const excelToJSONMapping = {
  Type: "type",
  Model: "model",
  impellerDia: "impellerDia",
  powerConsumption: "powerConsumption",
  motorRpm: "motorRpm",
  Voltage: "electricalSpecs.voltage",
  Phase: "electricalSpecs.phase",
  Frequency: "electricalSpecs.frequency",
  AirFlow: "maxAirflow",
  AirFlow_1_4inWG: "performance.airFlow_1_4inWG",
  AirFlow_1inWG: "performance.airFlow_1inWG",
  Noise_dB: "noiseLevel",

  A_Dim: "dimensions.A",
  B_Dim: "dimensions.B",
  C_Dim: "dimensions.C",
  D_Dim: "dimensions.D",
  H_Dim: "dimensions.H",
  N_Dim: "dimensions.N",

  Shaft_ØJ: "mechanicalSpecs.shaftDiameter",
  Bearing_UCP: "mechanicalSpecs.bearing",

  Weight: "weights.total",
  Weight_Belt: "weights.belt",
  Weight_Direct: "weights.direct",

  // اگه نیاز باشه میشه ستون‌های دیگه مثل Power (kW) و Speed (RPM) رو هم اضافه کرد
  Power_kW: "power.kW",
  Power_Watt: "power.Watt",
  Speed_RPM: "motorRpm"
};
