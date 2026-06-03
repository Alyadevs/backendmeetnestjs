import { Injectable, OnModuleInit } from '@nestjs/common';

// ⚠️ IMPORTANT : utiliser require
import AmiClient from 'asterisk-manager';

@Injectable()
export class AmiService implements OnModuleInit {
  private ami: any;

  onModuleInit() {
    this.ami = new AmiClient(
      5038,           // port AMI
      '192.168.1.200',    // host
      'admin_ami',    // username
      'monpassword123', // password
      true, // events
    );

    this.ami.keepConnected();

    console.log('✅ AMI connecté à Asterisk');
  }

  async hangupChannel(channel: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          action: 'Hangup',
          Channel: channel,
        },
        (err: any, res: any) => {
          if (err) {
            console.error('❌ Erreur hangup:', err);
            return reject(err);
          }
          console.log('📞 Appel raccroché:', channel);
          resolve();
        },
      );
    });
  }
}
