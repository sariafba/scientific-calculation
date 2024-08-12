export class Force {


    constructor( Rw , Aw , Cw , Vw , Ra , Aa , Ca , Va , wavePower , eK  , eN , eD ){

        // Wind Resistance Veriables
        this.Ra = Ra;
        this.Va= Ca;
        this.Ca = Ca;
        this.Aa = Aa;

        // Water Resistance Veriables
        this.Rw = Rw;
        this.Vw= Vw;
        this.Cw = Cw;
        this.Aw = Aw;

        // Wave Power
        this.wavePower = wavePower;

        // Engine Power
        this.eK = 0.2 ;
        this.eN = 3000 ;
        this.eD = 0.5 ;


    }





    intensityOfWaterResistance() {
        return  waterRes =  0.5 * this.Rw * this.Vw * this.Cw * this.Aw;
    }

    intensityOfWindResistance() {
        return windRes =  0.5 * this.Ra * this.Va * this.Ca * this.Aa;
    }

    intensityOfEnginePower() {
        return enginePower = this.eK * this.Rw * Math.pow(this.eN,2 ) * Math.pow(this.eD , 4)  ;
    }

    sideOffForce(angle, x1, y1, x2, y2) {

    }
}